/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';

import InViewport from '@herberthtk/react-native-viewport';

const Section = () => {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback((isVisible: boolean) => {
    setFocused(isVisible);
  }, []);

  const backgroundColor = focused ? 'red' : '#ccc';
  console.log('Focused', focused);
  return (
    <InViewport
      visiblePercentage={70}
      delay={100}
      onChange={handleChange}
      style={[styles.section, { backgroundColor }]}
    >
      <Text style={focused ? { color: '#fff' } : { color: '#000' }}>
        {focused ? 'Focused' : 'Not focused'}
      </Text>
    </InViewport>
  );
};

const App = (): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {[...new Array(5)].map((_, k) => (
          <Section key={k} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: 'blue',
    borderBottomWidth: 4,
  },
});

export default App;
