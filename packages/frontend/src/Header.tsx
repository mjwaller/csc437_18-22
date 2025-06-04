import "./Header.css";
import { Link } from "react-router";

export function Header() {
    return (
        <header>
            <h1>My cool image site</h1>
            <div>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/login">Log in</Link>
                </nav>
            </div>
        </header>
    );
}
