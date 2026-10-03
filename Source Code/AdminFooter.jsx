function AdminFooter() {
  return (
    <footer className="admin-footer">

      <div className="admin-footer-left">
        <strong>
          BAKE<span>DROP</span>
        </strong>

        <span>
          Administration Panel
        </span>
      </div>


      <div className="admin-footer-center">
        © {new Date().getFullYear()} BakeDrop.
        All rights reserved.
      </div>


      <div className="admin-footer-right">
        <span className="admin-status-dot"></span>
        System Online
      </div>

    </footer>
  );
}

export default AdminFooter;