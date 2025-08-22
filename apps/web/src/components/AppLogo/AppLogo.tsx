import { Icon } from '@iconify/react';
import cn from 'classnames';
import { ComponentProps, FC } from 'react';

const AppLogo: FC<Pick<ComponentProps<'div'>, 'className'>> = (props) => {
  return (
    <div
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 font-bold tracking-tight',
        props.className
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white">
        <Icon icon="fluent:video-recording-20-filled" className="w-5 h-5" />
      </div>
      <span className="text-gray-900">STELLAR</span>
    </div>
  );
};

export default AppLogo;
