import React from "react";
import { Link } from 'react-router-dom';
import './Reports.css'
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";

const Reports = () => {
    return (
        <LayoutsMainContent>
            <ContentHeader name="Reports"/>
            {/* Entry Content */}
            <div className="row">
                <div className="col-sm-6 mb-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Neraca</h5>
                            <p className="card-text">Menampilan apa yang anda miliki (aset), apa yang anda hutang (liabilitas), dan apa yang anda sudah investasikan pada perusahaan anda (ekuitas).</p>
                            <Link to="balance-sheet" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 mb-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Laporan Laba-Rugi</h5>
                            <p className="card-text">Menampilkan setiap tipe transaksi dan jumlah total untuk pendapatan dan pengeluaran anda.</p>
                            <Link href="#" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 mb-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Arus Kas</h5>
                            <p className="card-text">Laporan ini mengukur kas yang telah dihasilkan atau digunakan oleh suatu perusahaan dan menunjukkan detail pergerakannya dalam suatu periode.</p>
                            <Link href="#" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 mb-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Perubahan Ekuitas</h5>
                            <p className="card-text">Menampilkan perubahan atau pergerakan dalam ekuitas pemilik yang terjadi dalam periode tertentu.</p>
                            <Link href="#" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 mb-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Neraca Saldo</h5>
                            <p className="card-text">Menampilkan saldo dari setiap akun, termasuk saldo awal, pergerakan, dan saldo akhir dari periode yang ditentukan.</p>
                            <Link href="#" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 mb-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Jurnal</h5>
                            <p className="card-text">Daftar semua jurnal per transaksi yang terjadi dalam periode waktu. Hal ini berguna untuk melacak di mana transaksi Anda masuk ke masing-masing rekening.</p>
                            <Link href="#" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 mb-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Buku Besar</h5>
                            <p className="card-text">Laporan ini menampilkan semua transaksi yang telah dilakukan untuk suatu periode. Laporan ini bermanfaat jika Anda memerlukan daftar kronologis untuk semua transaksi yang telah dilakukan oleh perusahaan Anda.</p>
                            <Link href="#" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 mb-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Kartu Stok</h5>
                            <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                            <Link href="#" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 mb-3 mb-sm-0">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Buku Besar Pembantu Piutang</h5>
                            <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                            <Link href="#" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Buku Besar Pembantu Utang</h5>
                            <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                            <Link href="#" className="btn btn-outline-primary btn-sm">Show</Link>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutsMainContent>
    )
}


export default Reports