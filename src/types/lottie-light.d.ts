// The light player build ships untyped — reuse the main package's types.
declare module 'lottie-web/build/player/lottie_light' {
  import lottie from 'lottie-web';
  export default lottie;
}
