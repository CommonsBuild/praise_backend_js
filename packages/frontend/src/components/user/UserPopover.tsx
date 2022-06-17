import { UserAvatar } from './UserAvatar';
import { Popover } from '@headlessui/react';
import React from 'react';
import { shortenEthAddress } from 'api/dist/user/utils';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserDto } from 'api/dist/user/types';
import { UserAccountDto } from 'api/dist/useraccount/types';
import { useRecoilValue } from 'recoil';
import { SingleUser } from '@/model/users';

interface UserPopoverProps {
  user?: UserDto;
  userAccount?: UserAccountDto;
  children: JSX.Element;
  className?: string;
  usePseudonym?: boolean;
}

export const WrappedUserPopover = ({
  user,
  userAccount,
  children,
  className,
  usePseudonym,
}: UserPopoverProps): JSX.Element | null => {
  const [open, setOpen] = React.useState(false);
  const [openTimeout, setOpenTimeout] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const [closeTimeout, setCloseTimeout] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const userAccountUser = useRecoilValue(SingleUser(userAccount?.user));

  if (!user && !userAccount) return null;

  if (usePseudonym) return children;

  let discordUsername: string | undefined;
  let ethereumAddress: string | undefined;

  if (user) {
    discordUsername = user.accounts?.find(
      (account) => account.platform === 'DISCORD'
    )?.name;
    ethereumAddress = user.ethereumAddress;
  } else {
    if (userAccountUser) {
      discordUsername = userAccountUser.accounts?.find(
        (account) => account.platform === 'DISCORD'
      )?.name;
      ethereumAddress = userAccountUser.ethereumAddress;
    } else {
      if (userAccount && userAccount.platform === 'DISCORD') {
        discordUsername = userAccount.name;
      }
    }
  }

  return (
    <Popover className={className}>
      <Popover.Button
        className=""
        onMouseEnter={(): void => {
          closeTimeout && clearTimeout(closeTimeout);
          !open && setOpenTimeout(setTimeout(() => setOpen(true), 500));
        }}
        onMouseLeave={(): void => {
          openTimeout && clearTimeout(openTimeout);
          setCloseTimeout(setTimeout(() => setOpen(false), 300));
        }}
      >
        {children}
      </Popover.Button>

      {open && (
        <div
          onMouseOver={(): void => {
            closeTimeout && clearTimeout(closeTimeout);
          }}
          onMouseLeave={(): void => {
            openTimeout && clearTimeout(openTimeout);
            setTimeout(() => setOpen(false), 300);
          }}
        >
          <Popover.Panel static className="absolute z-10">
            <div className="p-5 text-sm border border-solid rounded-lg shadow-m bg-warm-gray-50 dark:bg-slate-900">
              <div className="mb-5 text-4xl">
                <UserAvatar user={user} userAccount={userAccount} />
              </div>
              {discordUsername && (
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faDiscord} size="1x" />
                  <span>{discordUsername}</span>
                </div>
              )}
              {ethereumAddress && (
                <div className="flex items-center mt-3 space-x-2">
                  <Jazzicon address={ethereumAddress} className="w-4 h-4" />
                  <span>{shortenEthAddress(ethereumAddress)}</span>
                </div>
              )}
            </div>
          </Popover.Panel>
        </div>
      )}
    </Popover>
  );
};

export const UserPopover = React.memo(WrappedUserPopover);
