import { Tabs, useRouter } from 'expo-router';
import { Settings, ArrowLeft } from 'lucide-react-native';
import { useColors } from '@/constants/colors';
import { StyleSheet, Pressable } from 'react-native';

export default function TabLayout() {
  const colors = useColors();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        // Hide bottom tab bar completely
        tabBarStyle: { display: 'none' },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 17,
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Save It',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/settings')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.6 }
              ]}
            >
              <Settings size={22} color={colors.text} strokeWidth={2} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: 'Settings',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.headerButtonLeft,
                pressed && { opacity: 0.6 }
              ]}
            >
              <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
    padding: 4,
  },
  headerButtonLeft: {
    marginLeft: 16,
    padding: 4,
  },
});
