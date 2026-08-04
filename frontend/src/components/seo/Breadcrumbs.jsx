import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { breadcrumbSchema } from './SchemaTemplates';

/**
 * Breadcrumbs — visual + JSON-LD structured data breadcrumb component.
 * 
 * Usage:
 *   <Breadcrumbs items={[
 *     { name: 'Aptitude', url: '/aptitude' },
 *     { name: 'Quantitative Aptitude' }  // last item has no url (current page)
 *   ]} />
 */
export default function Breadcrumbs({ items = [], className = '' }) {
  const location = useLocation();

  // Prepend Home
  const fullItems = [
    { name: 'Home', url: '/' },
    ...items,
  ];

  // Generate JSON-LD
  const schema = breadcrumbSchema(fullItems);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Visual breadcrumbs */}
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto ${className}`}
      >
        <ol className="flex items-center gap-1.5 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
          {fullItems.map((item, idx) => {
            const isLast = idx === fullItems.length - 1;
            const isHome = idx === 0;

            return (
              <li 
                key={idx} 
                className="flex items-center gap-1.5"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                )}
                {isLast ? (
                  <span 
                    className="text-foreground font-medium truncate max-w-[200px]"
                    itemProp="name"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    to={item.url}
                    className="hover:text-foreground transition-colors truncate max-w-[200px] flex items-center gap-1"
                    itemProp="item"
                  >
                    {isHome && <Home className="w-3.5 h-3.5" />}
                    <span itemProp="name">{isHome ? '' : item.name}</span>
                  </Link>
                )}
                <meta itemProp="position" content={String(idx + 1)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
