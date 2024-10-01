# react-native-viewport

A React Native wrapper to check whether a component is in the view port to track impressions

## Installation

```sh
    npm install react-native-viewport
```
OR
```sh
    yarn add react-native-viewport
```

## Usage


```js
import InViewport from 'react-native-viewport';

 const Section = () => {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback((isVisible: boolean) => {
    setFocused(isVisible);
  }, []);

  const backgroundColor = focused ? 'red' : '#ccc';

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

```


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [Herbert kavuma](https://herbert.netbritz.com/)
