export interface PasswordRuleItem {
  id: 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';
  label: string;
  passed: boolean;
}

export interface PasswordEvaluation {
  rules: PasswordRuleItem[];
  passedCount: number;
  totalCount: number;
  isComplete: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  strengthPercent: number;
}

export function evaluatePassword(password: string): PasswordEvaluation {
  const pwd = password || '';

  const rules: PasswordRuleItem[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      passed: pwd.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'At least 1 uppercase letter (A-Z)',
      passed: /[A-Z]/.test(pwd),
    },
    {
      id: 'lowercase',
      label: 'At least 1 lowercase letter (a-z)',
      passed: /[a-z]/.test(pwd),
    },
    {
      id: 'number',
      label: 'At least 1 number (0-9)',
      passed: /[0-9]/.test(pwd),
    },
    {
      id: 'special',
      label: 'At least 1 special symbol (!@#$%...)',
      passed: /[^A-Za-z0-9]/.test(pwd),
    },
  ];

  const passedCount = rules.filter((r) => r.passed).length;
  const totalCount = rules.length;
  const isComplete = passedCount === totalCount;

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  let strengthPercent = (passedCount / totalCount) * 100;

  if (passedCount <= 2) {
    strength = 'weak';
  } else if (passedCount === 3) {
    strength = 'fair';
  } else if (passedCount === 4) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    rules,
    passedCount,
    totalCount,
    isComplete,
    strength,
    strengthPercent,
  };
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const evaluation = evaluatePassword(password);
  const errors = evaluation.rules
    .filter((r) => !r.passed)
    .map((r) => r.label);

  return {
    isValid: evaluation.isComplete,
    errors,
  };
}
