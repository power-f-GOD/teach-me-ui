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
  </ul>
);
const LandingNav = (
  <ul>
    <li>
      <Link to='/signin'>Signin</Link>
    </li>
    <li>
      <Link to='/signup'>Signup</Link>
    </li>
  </ul>
);

const Nav = (props: NavProps) => {
  return <nav>{props.for === 'main' ? MainNav : LandingNav}</nav>;
};

export default Nav;
