import React from 'react';
import { classNames } from '../css';

interface SupportLinkProps {
  contact?: string;
  href?: string;
  classes?: string;
}

export const SupportLink: React.FC<SupportLinkProps> = ({
  contact = 'contact support',
  href = 'mailto:support@@audetic.ai',
  classes = '',
}) => {
  const cx = classNames('text-sm font-semibold text-gray-900', classes);
  return (
    <a href={href} className={cx}>
      {contact} <span aria-hidden="true">&rarr;</span>
    </a>
  );
};
