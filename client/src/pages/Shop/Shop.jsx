import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import queryString from "query-string";
import ProductAPI from "../../API/ProductAPI";
import Search from "./Component/Search";
import Pagination from "./Component/Pagination";
import Products from "./Component/Products";
import SortProduct from "./Component/SortProduct";
import convertMoney from "../../util/convertMoney";

function Shop(props) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  //state dùng để sắp xếp sản phẩm
  const [sort, setSort] = useState("default");

  //Tổng số trang
  const [totalPage, setTotalPage] = useState();

  // Get category parram from url by localtion
  const category =
    new URLSearchParams(window.location.search).get("category") || "all";

  //Từng trang hiện tại
  const [pagination, setPagination] = useState({
    page: "1",
    count: "9",
    search: "",
    category: category,
  });

  //Hàm nà dùng để lấy value từ component SortProduct truyền lên
  const handlerChangeSort = (value) => {
    setSort(value);
  };

  //Hàm này dùng để thay đổi state pagination.page
  //Nó sẽ truyền xuống Component con và nhận dữ liệu từ Component con truyền lên
  const handlerChangePage = (value) => {
    //Sau đó set lại cái pagination để gọi chạy làm useEffect gọi lại API pagination
    setPagination({
      page: value,
      count: pagination.count,
      search: pagination.search,
      category: pagination.category,
    });
  };

  //Hàm này dùng để thay đổi state pagination.search
  //Hàm này sẽ truyền xuống Component con và nhận dữ liệu từ Component con truyền lên
  const handlerSearch = (value) => {
    setPagination((prev) => ({
      ...prev,
      // page: "1",
      search: value,
    }));
  };

  //Hàm này dùng để thay đổi state pagination.category
  const handlerCategory = (value) => {
    setPagination((prev) => ({
      ...prev,
      page: "1",
      category: value,
    }));
  };

  //Gọi hàm useEffect tìm tổng số sản phẩm để tính tổng số trang
  //Và nó phụ thuộc và state pagination
  useEffect(() => {
    const fetchData = async () => {
      const query = queryString.stringify(pagination);
      const newQuery = "?" + query;

      setLoading(true);
      const response = await ProductAPI.getPagination(newQuery);

      if (response) {
        setProducts(response.items);
        //Tính tổng số trang = tổng số sản phẩm / số lượng sản phẩm 1 trang
        const totalPage = Math.ceil(
          parseInt(response.totalItems) / parseInt(pagination.count)
        );
        setTotalPage(totalPage);
      }
      setLoading(false);
    };

    fetchData();
  }, [pagination]);

  return (
    <div className="container">
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row px-4 px-lg-5 py-lg-4 align-items-center">
            <div className="col-lg-6">
              <h1 className="h2 text-uppercase mb-0">Shop</h1>
            </div>
            <div className="col-lg-6 text-lg-right">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-lg-end mb-0 px-0">
                  <li className="breadcrumb-item active" aria-current="page">
                    Shop
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* -------------Modal Product----------------- */}
      {products &&
        products.map((value) => (
          <div
            className="modal fade show"
            id={`product_${value._id}`}
            key={value._id}
          >
            <div
              className="modal-dialog modal-lg modal-dialog-centered"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-body p-0">
                  <div className="row align-items-stretch">
                    <div className="col-lg-6 p-lg-0">
                      <img
                        style={{ width: "100%" }}
                        className="product-view d-block h-100 bg-cover bg-center"
                        src={value.img1}
                        data-lightbox={`product_${value._id}`}
                      />
                      <img className="d-none" href={value.img2} />
                      <img className="d-none" href={value.img3} />
                    </div>
                    <div className="col-lg-6">
                      {/* Để tắt modal phải có class="close" và data-dissmiss="modal" và aria-label="Close" */}
                      <a
                        className="close p-4"
                        type="button"
                        href="#section_product"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        ×
                      </a>
                      <div className="p-5 my-md-4">
                        <ul className="list-inline mb-2">
                          <li className="list-inline-item m-0">
                            <i className="fas fa-star small text-warning"></i>
                          </li>
                          <li className="list-inline-item m-0">
                            <i className="fas fa-star small text-warning"></i>
                          </li>
                          <li className="list-inline-item m-0">
                            <i className="fas fa-star small text-warning"></i>
                          </li>
                          <li className="list-inline-item m-0">
                            <i className="fas fa-star small text-warning"></i>
                          </li>
                          <li className="list-inline-item m-0">
                            <i className="fas fa-star small text-warning"></i>
                          </li>
                        </ul>
                        <h2 className="h4">{value.name}</h2>
                        <p className="text-muted">
                          {convertMoney(value.price)} VND
                        </p>
                        <p className="text-small mb-4">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. In ut ullamcorper leo, eget euismod orci. Cum
                          sociis natoque penatibus et magnis dis parturient
                          montes nascetur ridiculus mus. Vestibulum ultricies
                          aliquam convallis.
                        </p>
                        <div className="row align-items-stretch mb-4">
                          <div className="col-sm-5 pl-sm-0 fix_addwish">
                            <a className="btn btn-dark btn-sm btn-block h-100 d-flex align-items-center justify-content-center px-0">
                              <i className="far fa-heart mr-2"></i>
                              Add Too Wish List
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      {/* -------------Modal Product----------------- */}

      <section className="py-5">
        <div className="container p-0">
          <div className="row">
            <div className="col-lg-3 order-2 order-lg-1">
              <h5 className="text-uppercase mb-4">Categories</h5>
              <div className="py-2 px-4 bg-dark text-white mb-3">
                <strong className="small text-uppercase font-weight-bold">
                  Apple
                </strong>
              </div>
              <ul className="list-unstyled small text-muted pl-lg-4 font-weight-normal">
                <li className="mb-2">
                  <Link
                    className="reset-anchor"
                    to={"/shop?category=all"}
                    onClick={() => {
                      handlerCategory("all");
                    }}
                  >
                    All
                  </Link>
                </li>
              </ul>
              <div className="py-2 px-4 bg-light mb-3">
                <strong className="small text-uppercase font-weight-bold">
                  Iphone & Mac
                </strong>
              </div>
              <ul className="list-unstyled small text-muted pl-lg-4 font-weight-normal">
                <li className="mb-2">
                  <Link
                    className="reset-anchor"
                    to={"/shop?category=iphone"}
                    onClick={() => {
                      handlerCategory("iphone");
                    }}
                  >
                    IPhone
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    className="reset-anchor"
                    to={"/shop?category=ipad"}
                    onClick={() => {
                      handlerCategory("ipad");
                    }}
                  >
                    Ipad
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    className="reset-anchor"
                    to={"/shop?category=macbook"}
                    onClick={() => {
                      handlerCategory("macbook");
                    }}
                  >
                    Macbook
                  </Link>
                </li>
              </ul>
              <div className="py-2 px-4 bg-light mb-3">
                <strong className="small text-uppercase font-weight-bold">
                  Wireless
                </strong>
              </div>
              <ul className="list-unstyled small text-muted pl-lg-4 font-weight-normal">
                <li className="mb-2">
                  <Link
                    className="reset-anchor"
                    to={"/shop?category=airpod"}
                    onClick={() => {
                      handlerCategory("airpod");
                    }}
                  >
                    Airpod
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    className="reset-anchor"
                    to={"/shop?category=watch"}
                    onClick={() => {
                      handlerCategory("watch");
                    }}
                  >
                    Watch
                  </Link>
                </li>
              </ul>
              <div className="py-2 px-4 bg-light mb-3">
                <strong className="small text-uppercase font-weight-bold">
                  Other
                </strong>
              </div>
              <ul className="list-unstyled small text-muted pl-lg-4 font-weight-normal mb-5">
                <li className="mb-2">
                  <Link
                    className="reset-anchor"
                    to={"/shop?category=mouse"}
                    onClick={() => {
                      handlerCategory("mouse");
                    }}
                  >
                    Mouse
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    className="reset-anchor"
                    to={"/shop?category=keyboard"}
                    onClick={() => {
                      handlerCategory("keyboard");
                    }}
                  >
                    Keyboard
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    className="reset-anchor"
                    to={"/shop?category=other"}
                    onClick={() => {
                      handlerCategory("other");
                    }}
                  >
                    Other
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-9 order-1 order-lg-2 mb-5 mb-lg-0">
              <div className="row mb-3 align-items-center">
                {/* ------------------Search----------------- */}
                <Search handlerSearch={handlerSearch} />
                {/* ------------------Search----------------- */}

                <div className="col-lg-8">
                  <ul className="list-inline d-flex align-items-center justify-content-lg-end mb-0">
                    <li className="list-inline-item">
                      <SortProduct handlerChangeSort={handlerChangeSort} />
                    </li>
                  </ul>
                </div>
              </div>

              {!loading ? (
                totalPage > 0 ? (
                  <>
                    <Products products={products} sort={sort} />
                    <Pagination
                      pagination={pagination}
                      handlerChangePage={handlerChangePage}
                      pLength={products.length}
                      totalPage={totalPage}
                    />
                  </>
                ) : (
                  <h3>No Product Found!</h3>
                )
              ) : (
                <h3>Loading...</h3>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Shop;
