const ErrPage500 = () => {
  return (
    <div className="text-center align-item-center p-5 w-80">
      <h1
        className="errTitle text-muted"
        style={{
          fontSize: "3rem",
          fontWeight: "800",
          color: "black",
          lineHeight: "4rem",
        }}
      >
        Error 500
      </h1>
      <h5 className="errSubtitle  pt-3">Something went wrong.</h5>
      <p className="errContent pt-1">
        Sorry for the inconvenience, we're working on it.
      </p>
    </div>
  );
};

export default ErrPage500;
