import { FileText, Download, BookOpen, Video, ExternalLink } from 'lucide-react';
import { SplitHeading, useRevealChildren } from '../motion';

export function Resources() {
  const revealRef = useRevealChildren(':scope > div > *, :scope > div > div > *');
  const resources = [
    {
      category: 'Getting Started',
      items: [
        { title: 'Member Handbook', type: 'PDF', icon: FileText },
        { title: 'Registration Guide', type: 'PDF', icon: FileText },
        { title: 'Platform Tutorial Video', type: 'Video', icon: Video },
      ],
    },
    {
      category: 'Healthcare Resources',
      items: [
        { title: 'Healthcare Facilities Directory', type: 'PDF', icon: FileText },
        { title: 'Emergency Contact List', type: 'PDF', icon: FileText },
        { title: 'How to Access Healthcare Services', type: 'Guide', icon: BookOpen },
      ],
    },
    {
      category: 'Education Resources',
      items: [
        { title: 'School Registration Guide', type: 'PDF', icon: FileText },
        { title: 'Partner Schools Directory', type: 'PDF', icon: FileText },
        { title: 'Academic Calendar 2025', type: 'PDF', icon: FileText },
        { title: 'Education System Overview', type: 'Guide', icon: BookOpen },
      ],
    },
    {
      category: 'Payment & Contributions',
      items: [
        { title: 'Payment Methods Guide', type: 'PDF', icon: FileText },
        { title: 'Contribution Schedule', type: 'PDF', icon: FileText },
        { title: 'Fee Structure Document', type: 'PDF', icon: FileText },
      ],
    },
    {
      category: 'Legal & Compliance',
      items: [
        { title: 'Terms and Conditions', type: 'PDF', icon: FileText },
        { title: 'Privacy Policy', type: 'PDF', icon: FileText },
        { title: 'Member Rights and Responsibilities', type: 'PDF', icon: FileText },
      ],
    },
  ];

  const externalLinks = [
    {
      title: 'Department of Home Affairs',
      description: 'Information on permits and documentation',
      url: '#',
    },
    {
      title: 'South African School System',
      description: 'Understanding the education system',
      url: '#',
    },
    {
      title: 'Healthcare Rights in South Africa',
      description: 'Your healthcare rights and options',
      url: '#',
    },
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div ref={revealRef} className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <SplitHeading as="h1" immediate text="Help & Resources" className="mb-4 font-display font-bold text-3xl md:text-5xl tracking-tight text-gray-900" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access helpful guides, documents, and resources to make the most of your membership
          </p>
        </div>

        {/* Quick Help Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center aa-lift">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="size-8 text-emerald-600" />
            </div>
            <h3 className="mb-2">Getting Started</h3>
            <p className="text-gray-600 text-sm mb-4">
              New to the platform? Start here to learn how everything works.
            </p>
            <button className="text-emerald-600 hover:text-emerald-700">Learn More →</button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center aa-lift">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="size-8 text-blue-600" />
            </div>
            <h3 className="mb-2">Video Tutorials</h3>
            <p className="text-gray-600 text-sm mb-4">
              Watch step-by-step video guides on using our services.
            </p>
            <button className="text-blue-600 hover:text-blue-700">Watch Videos →</button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center aa-lift">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="size-8 text-purple-600" />
            </div>
            <h3 className="mb-2">FAQ</h3>
            <p className="text-gray-600 text-sm mb-4">
              Find answers to frequently asked questions.
            </p>
            <a href="/faq" className="text-purple-600 hover:text-purple-700">
              View FAQ →
            </a>
          </div>
        </div>

        {/* Resource Categories */}
        <div className="space-y-8">
          {resources.map((category, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="mb-4">{category.category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIdx}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                    >
                      <Icon className="size-6 text-emerald-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.type}</p>
                      </div>
                      <Download className="size-5 text-gray-400 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* External Links */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="mb-4">Helpful External Links</h2>
          <div className="space-y-4">
            {externalLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div>
                  <h3 className="mb-1">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
                <ExternalLink className="size-5 text-blue-600 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-12 bg-emerald-50 rounded-lg p-8 text-center">
          <h3 className="mb-3">Need Additional Help?</h3>
          <p className="text-gray-600 mb-6">
            Our support team is available to assist you with any questions or concerns.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/contact"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/faq"
              className="bg-white text-emerald-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 border border-emerald-600"
            >
              View FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
