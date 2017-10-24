function* foo() {
  yield pausable(somePromise, "bar");
}