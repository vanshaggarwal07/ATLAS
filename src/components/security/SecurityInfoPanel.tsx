import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Server, 
  Key,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityInfoPanelProps {
  className?: string;
}

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'Your data is encrypted using AES-256 before storage',
    status: 'active',
  },
  {
    icon: EyeOff,
    title: 'Zero Admin Access',
    description: 'Platform administrators cannot view your raw data',
    status: 'active',
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'Hosted on enterprise-grade cloud with SOC 2 compliance',
    status: 'active',
  },
  {
    icon: Key,
    title: 'Access Control',
    description: 'Only you and your authorized team can access your data',
    status: 'active',
  },
];

export function SecurityInfoPanel({ className }: SecurityInfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-6",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Your Data is Protected</h3>
          <p className="text-sm text-muted-foreground">
            Enterprise-grade security for your business information
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <feature.icon size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{feature.title}</span>
                {feature.status === 'active' && (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-amber-700 dark:text-amber-300">Privacy Note:</span>{' '}
            Your uploaded datasets and analysis results are visible only to you and your authorized team members. 
            Platform administrators do not have access to your business data.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
