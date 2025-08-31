import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <h1>RunicCraft</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">서버 소개</Link>
          </li>
          <li>
            <Link to="/calculator">확률 계산기</Link>
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
