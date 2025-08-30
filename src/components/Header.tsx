import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <h1>RunicCraft</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/calculator">Calculator</Link>
          </li>
          <li>
            <Link to="/guides">Guides</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
