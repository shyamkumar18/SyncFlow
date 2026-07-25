import Card from '../components/ui/Card';

const helpTopics = [
  { title: 'Getting Started', desc: 'Learn how to connect your Gmail account and start tracking transactions.' },
  { title: 'Gmail Integration', desc: 'How to connect, reconnect, and manage your Gmail connection securely.' },
  { title: 'Transaction Categories', desc: 'Understanding how transactions are automatically categorized.' },
  { title: 'Budget Management', desc: 'Create and manage budgets to track your spending limits.' },
  { title: 'Analytics & Reports', desc: 'Interpret your spending patterns and generate reports.' },
  { title: 'Account Settings', desc: 'Manage your profile, preferences, and account security.' },
  { title: 'Data Privacy', desc: 'How your data is encrypted and protected end-to-end.' },
  { title: 'Troubleshooting', desc: 'Common issues and how to resolve them.' },
];

export default function HelpCentrePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help Centre</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Guides and documentation for using $yncFlow</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {helpTopics.map((topic) => (
          <Card key={topic.title} hover className="cursor-default">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{topic.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{topic.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
