import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PiSignOut, PiUserCircle } from 'react-icons/pi';
import { useAuth } from '../../AuthContext';
import './dropdown.css';

export default function Dropdown() {
  const { logout } = useAuth();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="IconButton" aria-label="Open account menu" title="Account">
          <PiUserCircle aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="DropdownMenuContent" sideOffset={7} align="end">
          <DropdownMenu.Item className="DropdownMenuItem" onClick={logout}>
            Sign out <span className="RightSlot"><PiSignOut /></span>
          </DropdownMenu.Item>
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
