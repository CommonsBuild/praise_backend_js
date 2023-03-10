import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountsExportSqlSchema,
} from './schemas/useraccounts.schema';
import { ServiceException } from '@/shared/exceptions/service-exception';
import {
  generateParquetExport,
  writeCsvAndJsonExports,
} from '@/shared/export.shared';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { randomBytes } from 'crypto';
import { CreateUserAccountInputDto } from './dto/create-user-account-input.dto';
import { UpdateUserAccountInputDto } from './dto/update-user-account-input.dto';
import { CreateUserAccountResponseDto } from './dto/create-user-account-response.dto';
import { FindUserAccountFilterDto } from './dto/find-user-account-filter.dto';

@Injectable()
export class UserAccountsService {
  constructor(
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<UserAccountDocument>,
    private readonly eventLogService: EventLogService,
  ) {}

  getModel(): Model<UserAccountDocument> {
    return this.userAccountModel;
  }

  /**
   * Creates a new UserAccount.
   * @param {CreateUserAccountInputDto} createUserAccountInputDto - The request payload containing the UserAccount Details
   * @returns A promise that resolves to the response containing the created UserAccount.
   * @throws {ServiceException}, If there is an error while creating the UserAccount.
   */
  async create(
    createUserAccountInputDto: CreateUserAccountInputDto,
  ): Promise<CreateUserAccountResponseDto> {
    const { user, name, accountId, platform } = createUserAccountInputDto;

    // Check if a UserAccount with same info already exists
    const existingUserAccount = await this.userAccountModel.findOne({
      $and: [{ platform }, { $or: [{ accountId }, { name }, { user }] }],
    });
    if (existingUserAccount) {
      throw new ServiceException(
        'UserAccount with platform and accountId, name or user already exists.',
      );
    }

    const userAccount = new this.userAccountModel({
      ...createUserAccountInputDto,
      activateToken: randomBytes(10).toString('hex'), // Generate a random activation token
    });
    await userAccount.save();

    this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.USER_ACCOUNT,
      description: `Created UserAccount id: ${userAccount.accountId}`,
    });

    return userAccount;
  }

  /**
   * Find the Useraccount by objectId
   */
  async findOneById(_id: Types.ObjectId): Promise<UserAccount> {
    const userAccount = await this.userAccountModel.findOne({ _id }).lean();
    if (!userAccount) throw new ServiceException('UserAccount not found.');
    return userAccount;
  }

  /**
   * Find all user accounts. Filter by user, accountId, name.
   */
  async findAll(filter?: FindUserAccountFilterDto): Promise<UserAccount> {
    const query = filter || {};
    return await this.getModel().find(query).lean();
  }

  /**
   * Find the latest added user account
   */
  async findLatest(): Promise<UserAccount> {
    const userAccount = await this.userAccountModel
      .find()
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (!userAccount[0]) throw new ServiceException('UserAccount not found.');
    return userAccount[0];
  }

  /**
   * Update a user account
   */
  async update(
    _id: Types.ObjectId,
    updateUserAccountDto: UpdateUserAccountInputDto,
  ): Promise<UserAccount> {
    const { accountId, name, user } = updateUserAccountDto;
    const userAccount = await this.userAccountModel.findById(_id);
    if (!userAccount) throw new ServiceException('UserAccount not found.');

    // Only one UserAccount per platform and user
    if (user) {
      const existingUserAccount = await this.userAccountModel.findOne({
        $and: [{ userAccount: userAccount.platform }, { user }],
      });
      if (existingUserAccount && !existingUserAccount._id.equals(_id)) {
        throw new ServiceException(
          'UserAccount with platform and user already exists.',
        );
      }
    }

    // Check if a UserAccount with same info already exists
    if (accountId || name || user) {
      const existingUserAccount = await this.userAccountModel.findOne({
        $and: [
          { platform: userAccount.platform },
          { $or: [{ accountId }, { name }, { user }] },
        ],
      });
      if (existingUserAccount) {
        throw new ServiceException(
          'UserAccount with platform and accountId, name or user already exists.',
        );
      }
    }

    for (const [k, v] of Object.entries(updateUserAccountDto)) {
      userAccount.set(k, v);
    }

    await userAccount.save();

    this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.USER_ACCOUNT,
      description: `Created UserAccount id: ${userAccount.accountId}`,
    });

    return userAccount.toObject();
  }

  /**
   * Generates all export files - csv, json and parquet
   */
  async generateAllExports(path: string) {
    const includeFields = [
      '_id',
      'accountId',
      'user',
      'name',
      'avatarId',
      'platform',
      'createdAt',
      'updatedAt',
    ];

    // Count the number of documents that matches query
    const count = await this.userAccountModel.countDocuments({});

    // If there are no documents, create empty files and return
    if (count === 0) {
      fs.writeFileSync(`${path}/useraccounts.csv`, includeFields.join(','));
      fs.writeFileSync(`${path}/useraccounts.json`, '[]');
      return;
    }

    // Lookup the periods, create a cursor
    const useraccounts = this.userAccountModel.aggregate([]).cursor();

    // Write the csv and json files
    await writeCsvAndJsonExports(
      'useraccounts',
      useraccounts,
      path,
      includeFields,
    );

    // Generate the parquet file
    await generateParquetExport(
      path,
      'useraccounts',
      UserAccountsExportSqlSchema,
    );
  }
}
