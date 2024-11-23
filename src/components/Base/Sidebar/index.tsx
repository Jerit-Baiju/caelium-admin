'use client';

import useLocalStorage from '@/hooks/useLocalStorage';
import ClickOutside from '../ClickOutside';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

interface MenuItem {
  icon?: JSX.Element;
  label: string;
  route: string;
  children?: MenuItem[];
}

interface MenuGroup {
  name: string;
  menuItems: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    name: 'Main Menu',
    menuItems: [
      {
        icon: <i className='fa-solid fa-chart-pie'></i>,
        label: 'Dashboard',
        route: '/',
      },
      {
        icon: <i className='fa-solid fa-users-rectangle'></i>,
        label: 'Chats',
        route: '/chats',
      },
      {
        icon: <i className='fa-solid fa-people-group'></i>,
        label: 'Users',
        route: '/users',
      },
      {
        icon: <i className='fa-solid fa-feather'></i>,
        label: 'Crafts',
        route: '/crafts',
      },
      {
        icon: <i className='fa-solid fa-scroll'></i>,
        label: 'Logs',
        route: '/logs',
      },
      {
        icon: <i className='fa-solid fa-bullhorn'></i>,
        label: 'Broadcast',
        route: '/logs',
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [pageName, setPageName] = useLocalStorage('selectedMenu', 'dashboard');
  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 duration-300 ease-linear' : '-translate-x-full'
        }`}>
        {/* <!-- SIDEBAR HEADER --> */}
        <div className='flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10'>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className='block lg:hidden'>
            <i className='fa-solid fa-arrow-left text-2xl'></i>
          </button>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div className='no-scrollbar flex flex-grow flex-col overflow-y-auto duration-300 ease-linear'>
          {/* <!-- Sidebar Menu --> */}
          <div className='flex h-full flex-col justify-between'>
            <nav className='mt-1 px-4 lg:px-6'>
              {menuGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className='mb-5 text-sm font-medium text-dark-4 dark:text-dark-6'>{group.name}</h3>
                  <ul className='mb-6 flex flex-col gap-2'>
                    {group.menuItems.map((menuItem, menuIndex) => (
                      <SidebarItem key={menuIndex} item={menuItem} pageName={pageName} setPageName={setPageName} />
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
