import logo from '../../assets/roriri logo.jpg';

const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-8">
            <div className="container mx-auto flex justify-between items-center">
                <img
                    src={logo}
                    alt="Roriri Logo"
                    className="h-10 cursor-pointer"
                    onClick={() => window.location.href = '/'}
                />
                {/* Add more navbar items if needed */}
            </div>
        </nav>
    );
};

export default Navbar;
