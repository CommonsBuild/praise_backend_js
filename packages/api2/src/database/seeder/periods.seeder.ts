import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { Period } from '@/periods/schemas/periods.schema';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { PeriodsService } from '@/periods/periods.service';

@Injectable()
export class PeriodsSeeder {
  constructor(private readonly periodsService: PeriodsService) {}

  /**
   * Generate and save a fake Period
   *
   * @param {Object} [PeriodData={}]
   * @returns {Promise<Period>}
   */
  seedPeriod = async (
    PeriodData: Record<string, unknown> = {},
  ): Promise<Period> => {
    const createdAt = faker.date.recent();

    const Period = await this.periodsService.getModel().create({
      name: faker.random.words(3),
      status: PeriodStatusType.OPEN,
      endDate: faker.date.recent(),
      createdAt,
      ...PeriodData,
    });

    return Period;
  };
}
