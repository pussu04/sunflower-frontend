import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Flower2, Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    age: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading } = useAuth();

  // Check if we're on the register route
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsRegisterMode(true);
    }
  }, [location.pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Remove demo login functionality - use real authentication only

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegisterMode) {
      if (!formData.username || !formData.age) {
        return;
      }
      
      const success = await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        age: parseInt(formData.age)
      });
      
      if (success) {
        setIsRegisterMode(false);
        setFormData({ email: '', password: '', username: '', age: '' });
      }
    } else {
      const success = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Back to Home Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-card/90 border-border shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto">
              <Flower2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">SunflowerScan.ai</CardTitle>
              <CardDescription className="text-muted-foreground">
                {isRegisterMode ? "Create your account" : "AI-Powered Plant Disease Detection"}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">

            {/* Login/Register Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Username field - only for register */}
              {isRegisterMode && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      className="pl-10"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Age field - only for register */}
              {isRegisterMode && (
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    required
                  />
                </div>
              )}

              <Button 
                type="submit"
                variant={isRegisterMode ? "default" : "outline"}
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading 
                  ? (isRegisterMode ? "Creating Account..." : "Signing in...") 
                  : (isRegisterMode ? "Create Account" : "Sign In")
                }
              </Button>
            </motion.form>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{" "}
                <button 
                  type="button"
                  onClick={() => {
                    if (isRegisterMode) {
                      navigate('/login');
                      setIsRegisterMode(false);
                    } else {
                      navigate('/register');
                      setIsRegisterMode(true);
                    }
                    setFormData({ email: '', password: '', username: '', age: '' });
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isRegisterMode ? "Sign in" : "Sign up"}
                </button>
              </p>
              {!isRegisterMode && (
                <button className="text-sm text-primary hover:underline">
                  Forgot your password?
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          © 2024 SunflowerScan.ai. Advanced plant disease detection.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;