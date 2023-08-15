import React, { Component, Fragment } from "react";
import './Dashboard.scss'
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";

class Dashboard extends Component {
    chart = () => {
        
    }
    
    componentDidMount() {
        // this.graphTest()
    }
    render() {
        return (
            <Fragment>
                <LayoutsMainContent>

                    <ContentHeader name="Dashboard"/>
                    {/* Entry Content */}
                    <canvas className="my-4 w-100" id="myChart" width="900" height="380"></canvas>

                    {/* <h2>Section title</h2>
                    <div className="table-responsive small">
                        <table className="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Header</th>
                                    <th scope="col">Header</th>
                                    <th scope="col">Header</th>
                                    <th scope="col">Header</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1,001</td>
                                    <td>random</td>
                                    <td>data</td>
                                    <td>placeholder</td>
                                    <td>text</td>
                                </tr>
                                <tr>
                                    <td>1,002</td>
                                    <td>placeholder</td>
                                    <td>irrelevant</td>
                                    <td>visual</td>
                                    <td>layout</td>
                                </tr>
                                <tr>
                                    <td>1,003</td>
                                    <td>data</td>
                                    <td>rich</td>
                                    <td>dashboard</td>
                                    <td>tabular</td>
                                </tr>
                                <tr>
                                    <td>1,003</td>
                                    <td>information</td>
                                    <td>placeholder</td>
                                    <td>illustrative</td>
                                    <td>data</td>
                                </tr>
                                <tr>
                                    <td>1,004</td>
                                    <td>text</td>
                                    <td>random</td>
                                    <td>layout</td>
                                    <td>dashboard</td>
                                </tr>
                                <tr>
                                    <td>1,005</td>
                                    <td>dashboard</td>
                                    <td>irrelevant</td>
                                    <td>text</td>
                                    <td>placeholder</td>
                                </tr>
                                <tr>
                                    <td>1,006</td>
                                    <td>dashboard</td>
                                    <td>illustrative</td>
                                    <td>rich</td>
                                    <td>data</td>
                                </tr>
                                <tr>
                                    <td>1,007</td>
                                    <td>placeholder</td>
                                    <td>tabular</td>
                                    <td>information</td>
                                    <td>irrelevant</td>
                                </tr>
                                <tr>
                                    <td>1,008</td>
                                    <td>random</td>
                                    <td>data</td>
                                    <td>placeholder</td>
                                    <td>text</td>
                                </tr>
                                <tr>
                                    <td>1,009</td>
                                    <td>placeholder</td>
                                    <td>irrelevant</td>
                                    <td>visual</td>
                                    <td>layout</td>
                                </tr>
                                <tr>
                                    <td>1,010</td>
                                    <td>data</td>
                                    <td>rich</td>
                                    <td>dashboard</td>
                                    <td>tabular</td>
                                </tr>
                                <tr>
                                    <td>1,011</td>
                                    <td>information</td>
                                    <td>placeholder</td>
                                    <td>illustrative</td>
                                    <td>data</td>
                                </tr>
                                <tr>
                                    <td>1,012</td>
                                    <td>text</td>
                                    <td>placeholder</td>
                                    <td>layout</td>
                                    <td>dashboard</td>
                                </tr>
                                <tr>
                                    <td>1,013</td>
                                    <td>dashboard</td>
                                    <td>irrelevant</td>
                                    <td>text</td>
                                    <td>visual</td>
                                </tr>
                                <tr>
                                    <td>1,014</td>
                                    <td>dashboard</td>
                                    <td>illustrative</td>
                                    <td>rich</td>
                                    <td>data</td>
                                </tr>
                                <tr>
                                    <td>1,015</td>
                                    <td>random</td>
                                    <td>tabular</td>
                                    <td>information</td>
                                    <td>text</td>
                                </tr>
                            </tbody>
                        </table>
                    </div> */}
                    
                </LayoutsMainContent>
                <script src="https://cdn.jsdelivr.net/npm/chart.js@4.2.1/dist/chart.umd.min.js" integrity="sha384-gdQErvCNWvHQZj6XZM0dNsAoY4v+j5P1XDpNkcM3HJG1Yx04ecqIHk7+4VBOCHOG" crossOrigin="anonymous"></script>
            </Fragment>
        )
    }
}


export default Dashboard