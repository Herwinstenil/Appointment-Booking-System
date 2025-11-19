import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

const Landing = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {/* Demo Content */}
                <div className="pt-24">
                    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="text-center text-white px-6">
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Welcome to Roriri Software Solutions
                            </h1>
                            <p className="text-xl text-gray-400">Your trusted partner in software development</p>
                        </div>
                    </div>
                    <div className="h-screen bg-gray-800 flex items-center justify-center">
                        <p className="text-white text-2xl">Keep scrolling...</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Landing;