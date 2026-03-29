import React from 'react';
import Avatar from '../components/atoms/Avatar';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';

const Contacts: React.FC = () => {
  const pendingRequests = [
    { id: 1, name: 'Alex Morgan', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnAsSEWY84pfIAsXCuH-imYOnVhEap_AqySr4uqeWSp7kJgnHrJpuzCoiSaMsdKDKPbDcv1ddAZn_7tljLoPNtLnifQVqER4QmTMJ86gjkE-C6PmiTuj5qpgD2abFW4run04LkiJDw_6ejQFfan82Q113yFl1Bvvmz6uMQJcVxfrQjUR92awVpk-FoOuQg7I5ChQSTETl_SzZyEHw3D8nZsm6gBXAbC5OcdQWp0gjF6FwVfy7SeqHdVE1cz54Z3NVKEBW11GmAww', reason: 'Wants to connect' },
    { id: 2, name: 'Sarah Chen', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyQS8aqRk6InVnA-KzZqKFSW4YDsHr-55OrNmy3vu8fZtueECUsTdKzuZuKbbQzi1aDp333EmcPNoPgTk54D2Z30HO9Gc0r1RffFI5SeTI6OXylxcUy1_j0QN2WgyCJ4L7ZI0f6jWp-m3PegeCkBOeFkadI3AdfW5lzc3rmV73J0qK2tWi9h2qDXDSUTPAzydgmGwDteVvJdLT_2OTfBZPHMt1td1dSr5lXgfjS4zBc0A9wxdYYD11hLS5xNP77_Lmc-zocFZPBg', reason: 'Shared a common group' },
  ];

  const allContacts = [
    { id: 1, name: 'Jordan Lee', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSoCNkucTCIPbKiDUUFmFDMWCurllnTsCUvjuzSnnc2tpDkBmSoPiQCVYJHTz2ulOTX3rClv0bg7Vi8edE6TAY7GtwRo-8jFDNMAHOoZ_fKq-85s3IXEOz66amZWS74K7lETRVYGdnfI2SF30oc0RI9REEH-EMevMRW7du9mukk8wJgR0I5xQkP5ymIrBv6VUCGzWSrwmB62bZTXBRgrV7ym-9_EeEEPrd7G16-VYk5zGTDFHjB7GVK6F4TM2htUKlDjH01Iho_g', status: 'online' as const },
    { id: 2, name: 'Riley King', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyqb4LIPJU-wkvWKUHR-UxzGKz3OmvsopcpivjVAz9HcNRSRZiCo-Mat0oOufzc0q63JW22O5TIx_AvKVyd7k7Ftk63FWmftZ2in8QUNnB6Hymx4JsGdiBcX4Mxns-Zr2MS640CuOucKO5jg_d0wdZWUOo1T59H9RZuezv1pFALVP63uuba3XyCH5Bgi3xt-hZBvAtI9ojz3cAwPDLrfD52gVJ1BjYvMx-_c7UWF7CsPOgEtFKxxzTwFYnUNCK8PKlzMs6ctiZLw', status: 'offline' as const },
    { id: 3, name: 'Maria Pena', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOQ0_Tywjsf8EAm7Uxw8GzUmVMadvNAFp8_IDOapp8zU4rhX3h19bLYbNqAaQxXtPZNe4CPTLAFclolMTumX67kr9rQJL_E-si3Lb_l3QxXsYA8y7HTnKSK0eCag0GS4EeiBZHOE1tKyioDB26cY45Jb7XhjNkvMfgK_0jYT6-DwUJdyhiYBd-AJXdJRNt5q8G4QLvXk7z57VW0L-NaL4tiQV2PEyld6rXhJpbmBkotclyUQUYrJGbP3F8rzCQaL9MJAsCfdzRbA', status: 'online' as const },
    { id: 4, name: 'David Ahmed', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGWhIQZn1RwKLgnwutGcc4y29-J7nQblW4yKqV7-85DBDj_lLLpjeHIAd9UyflKxEVFnGMFkOUwBsqCf4GkF46kzga7LSlSkgC9iR9Jb9MZQKVHMTHne2Q4v3Djhz82IcSPX7re9VhEu7WXpsEcRaeQVYJmIok60lpr-N7zXcyYk9_aKnp5wXmwjMxo8Z4vY_6NcpNzm_71wrbrm2PMiR0ku5EnCaaqkugHCMlpInE2efHXyCNQEzmQmlFZKG1vMxXNGyfFMBMFg', status: 'online' as const },
    { id: 5, name: 'Lily Wong', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSOIlIVvaw5QIccXLeXKcAIQ5hW93xVo_K7QBQUXxnpALenAkbb1IqmO_rgi-WFzat_a_ZuwAd8nxXT2LcixTKyNMnAAf3ww4K4rmf747L25yXZNg2sH8amPLlKrTVroG2-9ISHF-PY1kwVfXNr0MAmck0dTHxl3Wp0BQvSQazb3FYeXBRxZ3XrPY75JK_SgsDvWJzWLL8qZCDt3qnTJotNJsEt9cVirYxxGmJZDvgXpK0ayrHtLCK9-1EMe5xCWJrRShKsuCFGg', status: 'online' as const },
  ];

  return (
    <div className="flex-1 min-h-screen bg-surface px-8 lg:px-12 py-10 animate-fade-in overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-on-surface tracking-tight mb-2 leading-none">Contacts</h1>
            <p className="text-on-surface-variant font-medium">Manage your network and friend requests</p>
          </div>
          <div className="relative w-full lg:max-w-md">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
            <input 
              type="text" 
              placeholder="Search contacts by name or email..." 
              className="w-full bg-surface-container-highest border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>

        {/* Pending Requests Section */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              Pending Friend Requests
              <Badge variant="primary" size="sm" className="px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </Badge>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-surface-container-lowest p-5 rounded-3xl flex items-center gap-4 group transition-all hover:shadow-sm border border-outline-variant/10">
                <Avatar src={req.avatar} size="lg" />
                <div className="flex-1">
                  <h3 className="font-bold text-on-surface">{req.name}</h3>
                  <p className="text-xs text-on-surface-variant font-medium">{req.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="primary" className="px-5 font-bold text-sm">Accept</Button>
                  <Button variant="secondary" className="px-5 font-bold text-sm">Decline</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Contacts Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-on-surface">All Contacts</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest leading-none">Sort by:</span>
              <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                Status <Icon name="expand_more" className="text-sm" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {allContacts.map(contact => (
              <div key={contact.id} className="bg-surface-container-lowest p-6 rounded-[2.5rem] border border-outline-variant/10 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <Avatar src={contact.avatar} size="lg" status={contact.status === 'online' ? 'online' : 'none'} />
                  <Button variant="ghost" className="w-10 h-10 p-0 text-on-surface-variant hover:text-error">
                    <Icon name="person_remove" />
                  </Button>
                </div>
                <h3 className="text-xl font-black text-on-surface mb-1">{contact.name}</h3>
                <p className="text-sm text-on-surface-variant mb-6 flex items-center gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${contact.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  {contact.status === 'online' ? 'Online' : 'Offline'}
                </p>
                <div className="flex gap-2">
                  <Button variant="primary" icon="chat_bubble" className="flex-1 font-bold text-sm py-3">Message</Button>
                  <Button variant="secondary" icon="visibility" className="w-12 h-12 p-0 flex items-center justify-center rounded-2xl" />
                </div>
              </div>
            ))}
            
            {/* Invite Card */}
            <div className="bg-indigo-50/50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-indigo-200/30 border-dashed flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-400 transition-all">
              <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center mb-4 text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                <Icon name="person_add" className="text-[28px]" />
              </div>
              <h3 className="font-bold text-on-surface text-lg">Invite Friend</h3>
              <p className="text-xs text-on-surface-variant px-4 font-medium mt-1 leading-relaxed">Grow your community and stay connected</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contacts;
