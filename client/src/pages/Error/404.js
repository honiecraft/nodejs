const ErrPage404 = () => {
  return (
    <div className="text-center align-item-center p-5 w-80">
      <h1
        className="errTitle text-muted"
        style={{
          fontSize: "3rem",
          fontWeight: "700",
          color: "black",
          lineHeight: "4rem",
        }}
      >
        Error 404
      </h1>
      <h5 className="errSubtitle  pt-3">Page Not Found</h5>
      <p className="errContent pt-1">
        The page you are looking for might have been removed had its name
        changed <br /> or is temporarily unavailable.
      </p>
    </div>
  );
};

export default ErrPage404;
