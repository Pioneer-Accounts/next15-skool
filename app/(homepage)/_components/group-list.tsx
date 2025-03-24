import { Loading } from "@/components/auth/loading";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Helper function to extract text content from potentially HTML description
const extractTextContent = (description?: string): string => {
    if (!description) return "";
    
    try {
        // Check if the description is a JSON string
        if (description.startsWith('[') && description.includes('"type":')) {
            const parsedContent = JSON.parse(description);
            
            // Extract text from the expected structure
            if (Array.isArray(parsedContent)) {
                // Collect all text content from all paragraphs
                const allText = parsedContent.reduce((acc, item) => {
                    if (item.type === 'paragraph' && item.content && Array.isArray(item.content)) {
                        // Extract text from each content item
                        const paragraphText = item.content
                            .filter(contentItem => contentItem.type === 'text' && contentItem.text)
                            .map(contentItem => contentItem.text)
                            .join(' ');
                        
                        if (paragraphText) {
                            acc = acc ? `${acc} ${paragraphText}` : paragraphText;
                        }
                    }
                    return acc;
                }, '');
                
                return allText;
            }
        }
        
        // If it's HTML content
        if (description.includes('<') && description.includes('>')) {
            return description.replace(/<[^>]*>/g, '');
        }
        
        // Plain text
        return description;
    } catch (error) {
        // If parsing fails, return the raw string
        console.error("Failed to parse description:", error);
        return description;
    }
};

export const GroupList = () => {
    const groups = useQuery(api.groups.listAll, {});
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleCreate = () => {
        router.push("/create");
    }

    // Filter groups based on search query
    const filteredGroups = groups?.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (groups === undefined) {
        return <Loading />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-3">Discover Communities</h1>
                <p className="text-slate-600 mb-6">
                    Find the perfect community to learn and grow or{" "}
                    <button 
                        onClick={handleCreate}
                        className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
                    >
                        create your own
                    </button>
                </p>
                
                {/* Search bar */}
                <div className="relative max-w-md mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search communities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 py-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            {filteredGroups.length === 0 && searchQuery !== "" ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <p className="text-slate-500 mb-4">No communities found matching &quot;{searchQuery}&quot;</p>
                    <Button onClick={() => setSearchQuery("")} variant="outline">Clear Search</Button>
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="mb-6 p-6 bg-slate-50 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">No Communities Yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md">Create your first community to start building your online learning platform.</p>
                    <Button onClick={handleCreate} size="lg" className="rounded-full px-6 py-2">Create a Community</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => {
                        // Extract and process the description
                        const descriptionText = extractTextContent(group.description);
                        const displayDescription = descriptionText || "Join this community to learn and connect with peers";
                        
                        return (
                            <div key={group._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col">
                                <div className="relative w-full pt-[56.25%]">
                                    {group.imageUrl ? (
                                        <Image 
                                            src={group.imageUrl}
                                            alt={group.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Image 
                                            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
                                            alt={group.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-green-100 text-green-800 text-xs font-medium py-1 px-2 rounded-full">Free</span>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{group.name}</h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
                                        {displayDescription}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 text-slate-500">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="8.5" cy="7" r="4"></circle>
                                                <path d="M20 8v6"></path>
                                                <path d="M23 11h-6"></path>
                                            </svg>
                                            <span className="text-sm text-slate-600">
                                                {group.memberCount || 0} {group.memberCount === 1 ? 'member' : 'members'}
                                            </span>
                                        </div>
                                        <div className="text-slate-800 font-bold">
                                            {/* Price could be dynamic based on group data */}
                                            Free
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        onClick={() => router.push(`/${group._id}`)}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium"
                                    >
                                        Join Community
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};