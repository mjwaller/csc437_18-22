import "./Header.css";
import { Link } from "react-router-dom";

export function Header() {
    return (
        <header>
            <h1>My cool image site</h1>
            <div>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/login">Log in</Link>
                    <Link to="/upload">Upload</Link>
                </nav>
            </div>
        </header>
    );
}
