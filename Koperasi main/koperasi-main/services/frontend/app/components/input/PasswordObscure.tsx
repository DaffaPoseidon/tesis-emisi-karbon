import { EyeIcon, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { Input } from "../ui/input";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordObscure = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="relative transition-all duration-300">
      <Input
        ref={ref}
        className={className}
        type={isPasswordVisible ? "text" : "password"}
        {...props}
      />
      {isPasswordVisible ? (
        <EyeOff
          className="absolute top-3 right-3 h-5 w-5 cursor-pointer text-gray-400 transition-opacity duration-300"
          onClick={togglePasswordVisibility}
        />
      ) : (
        <EyeIcon
          className="absolute top-3 right-3 h-5 w-5 cursor-pointer text-gray-400 transition-opacity duration-300"
          onClick={togglePasswordVisibility}
        />
      )}
    </div>
  );
});

PasswordObscure.displayName = "PasswordObscure";

export default PasswordObscure;
