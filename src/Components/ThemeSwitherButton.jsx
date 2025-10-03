import { useContext } from 'react';
import { ThemeContext } from "../hooks/useTheme";


const ThemeSwitcherButton = () => {
    const {theme, toggleTheme} = useContext(ThemeContext);

    return (
        <button onClick={toggleTheme} className='themeSwitcher'>
            {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
    );
};

export default ThemeSwitcherButton;