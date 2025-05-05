import { useState, useEffect } from "react";
import BottomNav from "@/components/bottom-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";

interface UserSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  language: string;
  helpTipsEnabled: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    notificationsEnabled: true,
    soundEnabled: true,
    darkMode: false,
    language: "english",
    helpTipsEnabled: true
  });

  const { data: userSettings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
    staleTime: 60000
  });
  
  // Apply settings when data is loaded
  useEffect(() => {
    if (userSettings) {
      setSettings(userSettings);
    }
  }, [userSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      const response = await apiRequest("PATCH", "/api/settings", newSettings);
      return await response.json();
    },
    onSuccess: (data) => {
      setSettings(prev => ({ ...prev, ...data }));
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive"
      });
    }
  });

  const handleToggleSetting = (key: keyof UserSettings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    updateSettingsMutation.mutate({ [key]: newValue });
  };

  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({ ...prev, language }));
    updateSettingsMutation.mutate({ language });
  };

  return (
    <>
      <main className="flex-1 p-4 overflow-auto bg-light">
        {/* Settings Header */}
        <div className="bg-white p-4 shadow-sm mb-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Settings</h2>
          </div>
        </div>
        
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mr-4">
              <span className="text-primary text-xl font-bold">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold">{user?.username || 'User'}</h3>
              <p className="text-dark/60 text-sm">Level {user?.level || 1} • {user?.xp || 0} XP</p>
            </div>
          </div>
        </div>
        
        {/* Settings Groups */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <Accordion type="single" collapsible className="w-full" defaultValue="notifications">
            {/* Notifications */}
            <AccordionItem value="notifications">
              <AccordionTrigger className="px-6 py-4">
                <div className="flex items-center">
                  <i className="ri-notification-3-line mr-3 text-primary"></i>
                  <span>Notifications</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Notifications</p>
                      <p className="text-xs text-dark/60">Receive alerts about achievements, rewards and new content</p>
                    </div>
                    <Switch 
                      checked={settings.notificationsEnabled} 
                      onCheckedChange={() => handleToggleSetting('notificationsEnabled')} 
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Sound & Display */}
            <AccordionItem value="display">
              <AccordionTrigger className="px-6 py-4">
                <div className="flex items-center">
                  <i className="ri-computer-line mr-3 text-primary"></i>
                  <span>Sound & Display</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sound Effects</p>
                      <p className="text-xs text-dark/60">Play sounds when earning rewards and completing lessons</p>
                    </div>
                    <Switch 
                      checked={settings.soundEnabled} 
                      onCheckedChange={() => handleToggleSetting('soundEnabled')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-xs text-dark/60">Use dark colors for the app interface</p>
                    </div>
                    <Switch 
                      checked={settings.darkMode} 
                      onCheckedChange={() => handleToggleSetting('darkMode')} 
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Language */}
            <AccordionItem value="language">
              <AccordionTrigger className="px-6 py-4">
                <div className="flex items-center">
                  <i className="ri-translate-2 mr-3 text-primary"></i>
                  <span>Language</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-2">
                  {["english", "spanish", "french", "albanian"].map((lang) => (
                    <div 
                      key={lang}
                      className={`p-3 rounded-lg flex items-center justify-between cursor-pointer ${
                        settings.language === lang ? 'bg-primary/10 border border-primary/30' : 'border'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      <span className="capitalize">{lang}</span>
                      {settings.language === lang && (
                        <i className="ri-check-line text-primary"></i>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Help & Support */}
            <AccordionItem value="help">
              <AccordionTrigger className="px-6 py-4">
                <div className="flex items-center">
                  <i className="ri-question-line mr-3 text-primary"></i>
                  <span>Help & Support</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Help Tips</p>
                      <p className="text-xs text-dark/60">Display helpful hints and tips while using the app</p>
                    </div>
                    <Switch 
                      checked={settings.helpTipsEnabled} 
                      onCheckedChange={() => handleToggleSetting('helpTipsEnabled')} 
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Contact Support",
                        description: "This feature will be available soon."
                      });
                    }}
                  >
                    <i className="ri-customer-service-2-line mr-2"></i>
                    Contact Support
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* About */}
            <AccordionItem value="about">
              <AccordionTrigger className="px-6 py-4">
                <div className="flex items-center">
                  <i className="ri-information-line mr-3 text-primary"></i>
                  <span>About</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">App Version:</span> 1.0.0</p>
                  <p className="text-sm"><span className="font-medium">Developer:</span> Financial Kids Team</p>
                  <div className="pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary"
                      onClick={() => {
                        toast({
                          title: "Terms & Privacy",
                          description: "This feature will be available soon."
                        });
                      }}
                    >
                      Terms & Privacy Policy
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Advanced Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-bold mb-4">Account</h3>
          
          <div className="space-y-3">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Reset Progress",
                  description: "This feature will be available soon.",
                  variant: "destructive"
                });
              }}
            >
              Reset Progress
            </Button>
          </div>
        </div>
      </main>
      <BottomNav active="profile" />
    </>
  );
}