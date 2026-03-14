const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="w-full bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
            <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-12">
                <div className="flex flex-col md:flex-row items-start justify-between gap-10 pb-10 border-b border-gray-200">
                    
                    {/* Brand Section */}
                    <div className="max-w-96">
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            DjangoReact
                        </span>
                        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                            This eCommerce application was developed by Feleke Zerihun using Python, Django, Django REST Framework, PostgreSQL, React, and Tailwind CSS.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 group">
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.925-3.744 13.94 13.94 0 001.555-5.938c0-.21-.005-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </a>
                            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 group">
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.58 0-.287-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.39-1.335-1.76-1.335-1.76-1.09-.746.082-.73.082-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.306.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.3-.535-1.52.117-3.16 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.64.24 2.86.118 3.16.768.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.62-5.476 5.92.43.37.824 1.102.824 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.698.83.578C20.565 21.795 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </a>
                            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 group">
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.204 0 22.225 0z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="flex flex-wrap md:flex-nowrap gap-12 md:gap-16">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Resources
                            </h3>
                            <ul className="space-y-3">
                                {['Documentation', 'Tutorials', 'Blog', 'Community'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Company
                            </h3>
                            <ul className="space-y-3">
                                {['About', 'Careers', 'Privacy', 'Terms'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 text-center">
                    <p className="text-sm text-gray-400">
                        © {currentYear} <span className="font-medium text-gray-500">DjangoReact</span>. 
                        All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;