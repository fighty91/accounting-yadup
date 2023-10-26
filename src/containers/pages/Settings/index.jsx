import React from "react";
import './Settings.scss'
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { Link } from "react-router-dom";

const Settings = () => {
    return(
        <LayoutsMainContent>
            <ContentHeader name="Settings"/>
            {/* Entry Content */}
            <div className="list-group">
                <Link to="mapping-accounts" className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">Mapping Accounts</h5>
                    </div>
                    <p className="mb-1 text-body-secondary">
                        Untuk pemetaan akun-akun yang dibutuhkan dalam pembuatan laporan keuangan. Pengaturan ini hanya dapat dilakukan oleh user level administrator. Sedangkan user level staf tidak dapat mengakses pengaturan ini.
                    </p>
                    <small className="text-body-secondary">Go to this page</small>
                </Link>
                <Link to="#" className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">User Role Access</h5>
                    </div>
                    <p className="mb-1 text-body-secondary">
                        Untuk mengatur akses aplikasi yang boleh diakses user. Pengaturan ini hanya dapat dilakukan oleh user level administrator. Sedangkan user level staf tidak dapat mengakses pengaturan ini.
                    </p>
                    <small className="text-body-secondary">Go to this page</small>
                </Link>
                <Link to="#" className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">Change Profile Name</h5>
                    </div>
                    <p className="mb-1 text-body-secondary">Untuk mengubah nama user yang ditampilkan pada aplikasi.</p>
                    <small className="text-body-secondary">Go to this page</small>
                </Link>
                <Link to="#" className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">Change Password</h5>
                    </div>
                    <p className="mb-1 text-body-secondary">Untuk mengubah password user dalam melakukan login aplikasi.</p>
                    <small className="text-body-secondary">Go to this page</small>
                </Link>
                <Link to="#" className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">Change Email</h5>
                    </div>
                    <p className="mb-1 text-body-secondary">Untuk mengubah email user dalam melakukan login aplikasi.</p>
                    <small className="text-body-secondary">Go to this page</small>
                </Link>
            </div>
        </LayoutsMainContent>
    )
}

export default Settings