"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Key, Bell, Mail, Clock, Shield } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    apifyToken: "",
    resendKey: "",
    alertEmail: "",
    viralThreshold: "10000",
    aiUgcThreshold: "0.7",
    dailyDigest: true,
    weeklyDigest: true,
    viralAlerts: true,
    aiUgcAlerts: true,
    scrapeFrequency: "daily",
    appPassword: "",
  });

  const handleSave = () => {
    console.log("Saving settings:", settings);
  };

  return (
    <div>
      <Header
        title="Settings"
        description="Configure your research suite"
        action={
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* API Keys */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-zinc-600" />
            <h2 className="text-lg font-semibold">API Keys</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Configure your external service API keys
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Apify API Token</label>
              <Input
                type="password"
                placeholder="Enter your Apify token"
                value={settings.apifyToken}
                onChange={(e) =>
                  setSettings({ ...settings, apifyToken: e.target.value })
                }
                className="mt-1"
              />
              <p className="mt-1 text-xs text-zinc-400">
                Get your token from console.apify.com/account/integrations
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Resend API Key</label>
              <Input
                type="password"
                placeholder="Enter your Resend API key"
                value={settings.resendKey}
                onChange={(e) =>
                  setSettings({ ...settings, resendKey: e.target.value })
                }
                className="mt-1"
              />
              <p className="mt-1 text-xs text-zinc-400">
                Get your key from resend.com/api-keys
              </p>
            </div>
          </div>
        </Card>

        {/* Email Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-zinc-600" />
            <h2 className="text-lg font-semibold">Email Notifications</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Configure email digest and alert settings
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Alert Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={settings.alertEmail}
                onChange={(e) =>
                  setSettings({ ...settings, alertEmail: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Digest</p>
                <p className="text-sm text-zinc-500">
                  Receive daily summary of new videos and trends
                </p>
              </div>
              <Switch
                checked={settings.dailyDigest}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, dailyDigest: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-zinc-500">
                  Receive weekly trend analysis and competitor updates
                </p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, weeklyDigest: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Alert Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-zinc-600" />
            <h2 className="text-lg font-semibold">Alert Thresholds</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Configure when to trigger alerts
          </p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Viral Content Alerts</p>
                <p className="text-sm text-zinc-500">
                  Get notified when content exceeds like threshold
                </p>
              </div>
              <Switch
                checked={settings.viralAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, viralAlerts: checked })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Viral Threshold (likes)</label>
              <Select
                value={settings.viralThreshold}
                onValueChange={(value) =>
                  setSettings({ ...settings, viralThreshold: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5000">5,000 likes</SelectItem>
                  <SelectItem value="10000">10,000 likes</SelectItem>
                  <SelectItem value="50000">50,000 likes</SelectItem>
                  <SelectItem value="100000">100,000 likes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AI UGC Detection Alerts</p>
                <p className="text-sm text-zinc-500">
                  Get notified when AI-generated content is detected
                </p>
              </div>
              <Switch
                checked={settings.aiUgcAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, aiUgcAlerts: checked })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">AI Score Threshold</label>
              <Select
                value={settings.aiUgcThreshold}
                onValueChange={(value) =>
                  setSettings({ ...settings, aiUgcThreshold: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">50% (More alerts)</SelectItem>
                  <SelectItem value="0.7">70% (Balanced)</SelectItem>
                  <SelectItem value="0.9">90% (High confidence only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Scraping Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-zinc-600" />
            <h2 className="text-lg font-semibold">Scraping Schedule</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Configure automatic scraping frequency
          </p>

          <div className="mt-4">
            <label className="text-sm font-medium">Default Scrape Frequency</label>
            <Select
              value={settings.scrapeFrequency}
              onValueChange={(value) =>
                setSettings({ ...settings, scrapeFrequency: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="manual">Manual only</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-zinc-400">
              Note: Higher frequency uses more Apify credits
            </p>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-zinc-600" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Configure app access password
          </p>

          <div className="mt-4">
            <label className="text-sm font-medium">App Password</label>
            <Input
              type="password"
              placeholder="Enter app password"
              value={settings.appPassword}
              onChange={(e) =>
                setSettings({ ...settings, appPassword: e.target.value })
              }
              className="mt-1"
            />
            <p className="mt-1 text-xs text-zinc-400">
              This password will be required to access the dashboard
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
