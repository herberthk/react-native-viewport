import React, { Component, type RefObject, memo } from 'react';
import { View, Dimensions, type ViewProps } from 'react-native';
import debounce from 'lodash/debounce';

/**
 * InViewport Component Props
 * @typedef {Object} InViewportProps
 */
interface InViewportProps extends ViewProps {
  /**
   * * @property {boolean} [disabled] - Whether the component should be disabled and not watch for visibility.
   */
  disabled?: boolean;
  /**
   * @property {number} [delay] - The interval delay (in ms) for checking visibility.
   */
  delay?: number;
  /**
   * @property {(isVisible: boolean) => void} onChange - Callback function invoked when visibility changes.
   */
  onChange: (isVisible: boolean) => void;
  /**
   *  @property {number} [threshold] - A fraction (0 to 1) that is greater than 0 but less than or equal to 1, 1 means 100% 0.7 means 70% and so on, The value indicate the minimum percentage of the container to be considered visible
   */
  threshold?: number;
}

/**
 * InViewport Component State
 * @typedef {Object} InViewportState
 */
interface InViewportState {
  /**
   * @property {number} rectTop - Top position of the component relative to the screen.
   */
  rectTop: number;
  /**
   * @property {number} rectBottom - Bottom position of the component relative to the screen.
   */
  rectBottom: number;
  /**
   * @property {number} rectHeight - Height of the component.
   */
  rectHeight: number;
  /**
   * @property {number} rectWidth - Width of the component.
   */
  rectWidth: number;
}

/**
 * InViewport Component
 *
 * A React Native component that monitors whether it is visible in the viewport
 * and triggers a callback when visibility changes. Can be used to detect when
 * a component scrolls into or out of view.
 */
class InViewport extends Component<InViewportProps, InViewportState> {
  private myview: RefObject<View> = React.createRef<View>(); // Reference to the View component
  private interval: NodeJS.Timeout | null = null; // Interval reference for checking visibility
  private lastValue: boolean | null = null; // Last known visibility state
  private subscription: { remove: () => void } | null = null; // Subscription for dimension change events

  constructor(props: InViewportProps) {
    super(props);
    this.state = { rectTop: 0, rectBottom: 0, rectHeight: 0, rectWidth: 0 };
  }

  /**
   * handleVisibilityChange
   *
   * Calls the onChange callback with the updated visibility state.
   * Uses a debounced version of the function for efficiency.
   * @param {boolean} isVisible - Whether the component is visible
   *
   * Debounce handleVisibilityChange for performance
   */
  handleVisibilityChange = debounce((isVisible: boolean) => {
    if (this.props.onChange) {
      this.props.onChange(isVisible);
    }
  }, 200);

  /**
   * componentDidMount
   *
   * Lifecycle method that sets up visibility checking and starts watching
   * when the component mounts.
   */
  componentDidMount() {
    if (!this.props.disabled) {
      this.startWatching();
      this.isInViewPort(); // Initial check for visibility on mount
      this.subscription = Dimensions.addEventListener(
        'change',
        this.isInViewPort
      );
    }
  }

  /**
   * componentDidUpdate
   *
   * Checks if the disabled prop has changed, and starts or stops
   * watching accordingly.
   * @param {InViewportProps} prevProps - Previous props
   */
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

  /**
   * componentWillUnmount
   *
   * Lifecycle method that clears the interval and removes event listeners
   * when the component unmounts.
   */
  componentWillUnmount() {
    this.stopWatching();
    // Remove the event listener when the component unmounts
    if (this.subscription) {
      this.subscription.remove();
    }
  }

  /**
   * startWatching
   *
   * Starts the interval for monitoring visibility and sets up
   * measurements for the component's position and size.
   */
  startWatching = () => {
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
  };

  /**
   * stopWatching
   *
   * Clears the interval that monitors visibility, stopping the checks.
   */
  stopWatching = () => {
    if (this.interval) {
      clearInterval(this.interval);
    }
  };

  /**
   * isInViewPort
   *
   * Determines whether the component is within the viewport based on
   * its top and bottom positions, the viewport height, and the specified
   * threshold. Calls handleVisibilityChange if the visibility state changes.
   */
  isInViewPort = () => {
    // Add defensive programming to ensure props and state are defined before accessing them
    if (!this.props || !this.state) {
      console.warn('Props or state is undefined');
      return;
    }
    let visiblePercentage = 100; // Default to 100% visibility

    if (this.props?.threshold) {
      const threshold = this.props.threshold;
      // Validate the threshold value
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
    // Calculate visible height percentage based on component position in the viewport
    const visibleHeight =
      Math.min(rectBottom, windowDimensions.height) - Math.max(rectTop, 0);
    const visibility = (visibleHeight / rectHeight) * 100;
    // Determine visibility based on threshold
    const isVisible =
      rectBottom !== 0 &&
      visibility >= visiblePercentage && // Check if at least the specified percentage is visible
      this.state.rectWidth > 0 &&
      this.state.rectWidth <= windowDimensions.width;

    if (this.lastValue !== isVisible) {
      this.lastValue = isVisible;
      // this.props.onChange(isVisible);
      this.handleVisibilityChange(isVisible); // Debounced visibility change
    }
  };

  /**
   * render
   *
   * Renders the View component and its children.
   */
  render() {
    return (
      <View collapsable={false} ref={this.myview} {...this.props}>
        {this.props.children}
      </View>
    );
  }
}

export default memo(InViewport);
