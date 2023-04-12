//import { EventLogTypeKey } from 'api/dist/eventlog/types';
//import { logEvent } from 'api/dist/eventlog/utils';
//import { Types } from 'mongoose';

import { CommandHandler } from '../interfaces/CommandHandler';
import { renderMessage, dmError } from '../utils/embeds/praiseEmbeds';
import { getUserAccount } from '../utils/getUserAccount';
import { GuildMember } from 'discord.js';
import { getActivateToken } from '../utils/getActivateToken';
import { getHost } from '../utils/getHost';

/**
 * Executes command /activate
 *  Creates a one-time link on the Praise frontend linking to the activate page
 *  where the user can associate their Discord user with a UserAccount
 *
 * @param client
 * @param interaction
 * @returns
 */
export const activationHandler: CommandHandler = async (
  client,
  interaction
) => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(dmError);
    return;
  }

  try {
    const host = await getHost(client, guild.id);

    if (host === undefined) {
      await interaction.editReply(
        'This community is not registered for praise.'
      );
      return;
    }

    const userAccount = await getUserAccount(
      (member as GuildMember).user,
      host
    );
    console.log(userAccount);
    if (
      userAccount.user &&
      userAccount.user !== null &&
      userAccount.user !== ''
    ) {
      await interaction.reply({
        content: await renderMessage(
          'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR',
          host
        ),
        ephemeral: true,
      });
      return;
    }

    // await logEvent(
    //   EventLogTypeKey.AUTHENTICATION,
    //   'Ran the /activate command on discord',
    //   {
    //     userAccountId: new Types.ObjectId(userAccount._id),
    //   }
    // );

    const activateToken = await getActivateToken(userAccount, host);
    console.log(activateToken);

    if (!activateToken) {
      await interaction.reply({
        content: 'Unable to activate user account.',
        ephemeral: true,
      });
      return;
    }

    const hostUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.FRONTEND_URL
        : `https://${(await client.urlCache.get(guild.id)) as string}`;

    const activationURL = `${hostUrl || 'undefined:/'}/activate?accountId=${
      member.user.id
    }&platform=DISCORD&token=${activateToken}`;

    await interaction.reply({
      content: `To activate your account, follow this link and sign a message using your Ethereum wallet. [Activate my account!](${activationURL})`,
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: 'Unable to activate user account.',
      ephemeral: true,
    });
  }
};
