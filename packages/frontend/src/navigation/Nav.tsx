import AdminOnly from '@/components/auth/AdminOnly';
import EthAccount from '@/components/EthAccount';
import { ActiveTokenSet } from '@/model/auth';
import { SingleSetting } from '@/model/settings';
import { classNames } from '@/utils/index';
import {
  faAngleRight,
  faCalculator,
  faCog,
  faPrayingHands,
  faQuestionCircle,
  faUserFriends,
  faBook,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import NavItem from './NavItem';

export default function Nav(): JSX.Element {
  const logoSetting = useRecoilValue(SingleSetting('LOGO'));

  return (
    <nav className="flex h-screen border-r shadow-sm md:w-64 md:flex-col md:fixed bg-gray-50">
      <div className="flex flex-col justify-between h-full">
        <div className="w-full">
          <ul className="relative h-full p-0 m-0 list-none">
            <li className="relative flex justify-start w-full p-4 text-2xl font-bold">
              <Link to="/">
                {logoSetting && (
                  <img
                    src={logoSetting.valueRealized as string}
                    className={'inline-block w-52'}
                  />
                )}
              </Link>
            </li>

            <NavItem
              icon={faPrayingHands}
              description="My praise"
              to="/mypraise"
            />
            <AdminOnly>
              <NavItem
                icon={faUserFriends}
                description="Quantifier pool"
                to="/pool"
              />
            </AdminOnly>
            <NavItem
              icon={faCalculator}
              description="Quantification periods"
              to="/periods"
            />
            <NavItem
              icon={faBook}
              description="Transparency Log"
              to="/eventlogs"
            />
            <AdminOnly>
              <NavItem
                icon={faCog}
                description="Settings"
                to="/settings/application"
              />
            </AdminOnly>
            <NavItem icon={faQuestionCircle} description="FAQ" to="/faq" />
          </ul>
        </div>
        <div className="w-full border-t">
          <Menu as="div" className="flex flex-col justify-center">
            <Menu.Button className="flex items-center justify-between w-full px-4 py-3 hover:text-gray-500 focus:outline-none">
              <EthAccount
                showDownCaret={false}
                showRightCaret={true}
                className="w-full"
              />
            </Menu.Button>
          </Menu>
        </div>
      </div>
    </nav>
  );
}
