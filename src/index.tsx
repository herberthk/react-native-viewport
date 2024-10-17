import React, { Component, type RefObject, memo } from 'react';
import { View, Dimensions, type ViewProps } from 'react-native';
import debounce from 'lodash/debounce';

interface InViewportProps extends ViewProps {
  disabled?: boolean;
  delay?: number;
  onChange: (isVisible: boolean) => void;
  threshold?: number;
}

interface InViewportState {
  rectTop: number;
  rectBottom: number;
  rectHeight: number;
  rectWidth: number;
}

class InViewport extends Component<InViewportProps, InViewportState> {
  private myview: RefObject<View> = React.createRef<View>();
  private interval: NodeJS.Timeout | null = null;
  private lastValue: boolean | null = null;
  private subscription: { remove: () => void } | null = null; // Type for the subscription object

  constructor(props: InViewportProps) {
    super(props);
    this.state = { rectTop: 0, rectBottom: 0, rectHeight: 0, rectWidth: 0 };
    this.handleVisibilityChange = debounce(this.handleVisibilityChange, 200);
  }

  handleVisibilityChange(isVisible: boolean) {
    this.props.onChange(isVisible);
  }

  componentDidMount() {
    if (!this.props.disabled) {
      this.startWatching();
      this.isInViewPort(); // Check immediately on mount
      this.subscription = Dimensions.addEventListener(
        'change',
        this.isInViewPort
      );
    }
  }

  componentDidUpdate(prevProps: InViewportProps) {
    if (prevProps.disabled !== this.props.disabled) {
      if (this.props.disabled) {
        this.stopWatching();
      } else {
        this.lastValue = null;
        this.startWatching();
      }
    }
  }

  componentWillUnmount() {
    this.stopWatching();
    // Remove the event listener when the component unmounts
    if (this.subscription) {
      this.subscription.remove();
    }
  }

  startWatching() {
    this.interval = setInterval(() => {
      if (!this.myview.current) {
        return;
      }

      this.myview.current.measure((_x, _y, width, height, pageX, pageY) => {
        this.setState({
          rectTop: pageY,
          rectBottom: pageY + height,
          rectHeight: height,
          rectWidth: pageX + width,
        });
      });

      this.isInViewPort();
    }, this.props.delay || 1000);
  }

  stopWatching() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  isInViewPort() {
    let visiblePercentage = 100; // Default to 100

    if (this.props?.threshold) {
      const threshold = this.props.threshold;
      // Handle invalid threshold values
      if (threshold <= 0 || threshold > 1) {
        console.error(
          'Threshold should be greater than zero and less or equal to one'
        );
      } else {
        visiblePercentage = threshold * 100;
      }
    }

    const windowDimensions = Dimensions.get('window');
    const { rectTop, rectBottom, rectHeight } = this.state;
    //const visiblePercentage = this.props?.threshold * 100 || 100; // Default to 100% visibility

    const visibleHeight =
      Math.min(rectBottom, windowDimensions.height) - Math.max(rectTop, 0);
    const visibility = (visibleHeight / rectHeight) * 100;

    const isVisible =
      rectBottom !== 0 &&
      visibility >= visiblePercentage && // Check if at least the specified percentage is visible
      this.state.rectWidth > 0 &&
      this.state.rectWidth <= windowDimensions.width;

    if (this.lastValue !== isVisible) {
      this.lastValue = isVisible;
      // this.props.onChange(isVisible);
      this.handleVisibilityChange(isVisible); // Use the debounced function
    }
  }

  render() {
    return (
      <View collapsable={false} ref={this.myview} {...this.props}>
        {this.props.children}
      </View>
    );
  }
}

export default memo(InViewport);
