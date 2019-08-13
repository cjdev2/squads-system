import React from 'react';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiLoading,
  mdiEmailOutline,
  mdiAccount,
  mdiHumanMaleFemale,
} from '@mdi/js';

export const CloseIcon = props => (
  <Icon path={mdiClose} size={'16px'} {...props} />
);
export const LoadingIcon = props => (
  <Icon path={mdiLoading} spin={1.5} {...props} />
);
export const ContactIcon = props => (
  <Icon path={mdiEmailOutline} size={'20px'} height={'20px'} {...props} />
);
export const GenericAvatar = ({on, ...props}) => (
  <Icon path={mdiAccount} {...props} />
);
export const HumanIcon = ({on, ...props}) => (
  <Icon path={mdiHumanMaleFemale} {...props} />
);
