import React from 'react';
import { Link } from 'react-router-dom';

interface NavProps {
  for?: string;
}

const MainNav = (
  <ul>
    <li>
      <Link to='/home'>Home</Link>
    </li>
    <li>
      <Link to='/about'>About</Link>
    </li>
    <li>
      <Link to='/signin'>Sign out</Link>
    </li>
  </ul>
);
const LandingNav = (
  <ul>
    <li></li>
    <li></li>
  </ul>
);

const Nav = (props: NavProps) => {
  return <nav>{props.for === 'main' ? MainNav : LandingNav}</nav>;
};

export default Nav;
