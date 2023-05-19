import React, { memo } from 'react';
import {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome5Pro,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  Octicons,
  Zocial,
  SimpleLineIcons,
} from '@expo/vector-icons';

const Icon = ({ type, name, ...anotherProps }) => {
  let icon;

  switch (type) {
    case 'AntDesign':
      icon = <AntDesign name={name} {...anotherProps} />;
      break;
    case 'Entypo':
      icon = <Entypo name={name} {...anotherProps} />;
      break;
    case 'EvilIcons':
      icon = <EvilIcons name={name} {...anotherProps} />;
      break;
    case 'Feather':
      icon = <Feather name={name} {...anotherProps} />;
      break;
    case 'FontAwesome':
      icon = <FontAwesome name={name} {...anotherProps} />;
      break;
    case 'FontAwesome5':
      icon = <FontAwesome5 name={name} {...anotherProps} />;
      break;
    case 'FontAwesome5Pro':
      icon = <FontAwesome5Pro name={name} {...anotherProps} />;
      break;
    case 'Fontisto':
      icon = <Fontisto name={name} {...anotherProps} />;
      break;
    case 'Foundation':
      icon = <Foundation name={name} {...anotherProps} />;
      break;
    case 'Ionicons':
      icon = <Ionicons name={name} {...anotherProps} />;
      break;
    case 'MaterialIcons':
      icon = <MaterialIcons name={name} {...anotherProps} />;
      break;
    case 'MaterialCommunityIcons':
      icon = <MaterialCommunityIcons name={name} {...anotherProps} />;
      break;
    case 'Octicons':
      icon = <Octicons name={name} {...anotherProps} />;
      break;
    case 'Zocial':
      icon = <Zocial name={name} {...anotherProps} />;
      break;
    case 'SimpleLineIcons':
      icon = <SimpleLineIcons name={name} {...anotherProps} />;
      break;
    default:
      icon = <FontAwesome name={name} {...anotherProps} />;
  }
  return icon;
};

export default memo(Icon);
