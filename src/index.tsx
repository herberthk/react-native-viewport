import React, { Component, type RefObject, memo } from 'react';
import { View, Dimensions, type ViewProps } from 'react-native';
interface InViewportProps extends ViewProps {
  disabled?: boolean;
  delay?: number;
  onChange: (isVisible: boolean) => void;
  visiblePercentage?: number; // Add visiblePercentage prop for custom visibility threshold
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

  constructor(props: InViewportProps) {
    super(props);
    this.state = { rectTop: 0, rectBottom: 0, rectHeight: 0, rectWidth: 0 };
  }

  componentDidMount() {
    if (!this.props.disabled) {
      this.startWatching();
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
    const windowDimensions = Dimensions.get('window');
    const { rectTop, rectBottom, rectHeight } = this.state;
    const visiblePercentage = this.props.visiblePercentage || 100; // Default to 100% visibility

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
      this.props.onChange(isVisible);
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
