import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container-atlas py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow overflow-hidden">
                <img src="/logo.png" alt="ATLAS" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight">ATLAS</span>
            </Link>
            <p className="body-default max-w-sm">
              The AI-native consulting platform that delivers strategy, decisions, 
              and execution — without consultants.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" className="body-default hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#demo" className="body-default hover:text-foreground transition-colors">
                  Demo
                </a>
              </li>
              <li>
                <a href="#why-atlas" className="body-default hover:text-foreground transition-colors">
                  Why ATLAS
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#testimonials" className="body-default hover:text-foreground transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <Link to="/login" className="body-default hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="body-default hover:text-foreground transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ATLAS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
