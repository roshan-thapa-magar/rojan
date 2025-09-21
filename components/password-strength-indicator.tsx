interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const checks = [
    {
      label: "At least 8 characters",
      test: password.length >= 8,
    },
    {
      label: "Lowercase letter",
      test: /[a-z]/.test(password),
    },
    {
      label: "Uppercase letter",
      test: /[A-Z]/.test(password),
    },
    {
      label: "Number",
      test: /\d/.test(password),
    },
    {
      label: "Special character (@$!%*?&)",
      test: /[@$!%*?&]/.test(password),
    },
  ];

  const passedChecks = checks.filter(check => check.test).length;
  const strengthPercentage = (passedChecks / checks.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage === 100) return "text-green-600";
    if (strengthPercentage >= 80) return "text-blue-600";
    if (strengthPercentage >= 60) return "text-yellow-600";
    if (strengthPercentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getStrengthText = () => {
    if (strengthPercentage === 100) return "Very Strong ✓";
    if (strengthPercentage >= 80) return "Strong";
    if (strengthPercentage >= 60) return "Good";
    if (strengthPercentage >= 40) return "Fair";
    return "Weak";
  };

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        Password strength: <span className={`font-medium ${getStrengthColor()}`}>{getStrengthText()}</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            strengthPercentage === 100 ? 'bg-green-500' :
            strengthPercentage >= 80 ? 'bg-blue-500' :
            strengthPercentage >= 60 ? 'bg-yellow-500' :
            strengthPercentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>

      {/* Check list */}
      <div className="space-y-1">
        {checks.map((check, index) => (
          <div 
            key={index}
            className={`text-xs flex items-center gap-1 ${
              check.test ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {check.test ? '✓' : '✗'} {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}
