import React from 'react';
import Lang from '../Lang';
import Icon from '../Icon';
import s from './paginate.module.css'
class Paginate extends React.Component {
  constructor(props) {
    super(props);
    this.isMount = false
    const paginate = props.paginate || {};
    this.state = {
      current_page: 1,
      page_size: paginate.page_size || 50,
      total_count: 0,
      total_pages: 1,
      temp_end_page: 0
    }

    if (paginate) {
      if (paginate.setPage) {
        paginate.setPage(this.setPage.bind(this));
      }
    }

    this.goToPage = this.goToPage.bind(this);
  }

  componentDidMount() {
    this.isMount = true
  }

  componentWillUnmount() {
    this.isMount = false
  }

  setPage(obj) {
    this.isMount && this.setState(obj);
    if (this.props.paginate && this.props.paginate.temp_end_page) this.props.paginate.temp_end_page(this.state.temp_end_page);
  }

  goToPage(currentPage) {
    if (currentPage === 0 || currentPage > this.state.total_pages) return;
    if (this.props.paginate && this.props.paginate.pageChanged) this.props.paginate.pageChanged(currentPage);
    this.isMount && this.setState({
      current_page: currentPage === -1 ? this.state.total_pages : currentPage
    })
  }

  render() {
    if (!this.props.paginate) return null;
    let start = (this.state.page_size * (this.state.current_page - 1) + 1) || 0;
    let end = (this.state.page_size * this.state.current_page) || 0;
    if (end > this.state.total_count) end = this.state.total_count;
    if (start < 0 || this.state.total_pages === 0) start = 0;
    if (start > end) start = end;
    const tempEndPage = this.state.temp_end_page || 0;
    return (
      <div className={s.paginate}>
        <div>{start || 0} <Lang>lang_to</Lang> {tempEndPage > 0 ? tempEndPage : end} <Lang>lang_of</Lang> {tempEndPage > 0 ? (this.state.total_count + tempEndPage - end) : (this.state.total_count || 0)}</div>
        <div>
          <div className={start <= 1 ? 'disabled' : ''} onClick={() => this.goToPage(1)}>
            <Icon src={'navigation/first-page'} />
          </div>
          <div className={start <= 1 ? 'disabled' : ''} onClick={() => this.goToPage(Number(this.state.current_page) - 1)}>
            <Icon src={'navigation/chevron-left'} />
          </div>
          <div className='textContent'>
            <span className='text-capitalize'><Lang>lang_page</Lang></span> {this.state.total_pages === 0 ? 1 : (this.state.current_page || 1)} <Lang>lang_of</Lang> {this.state.total_pages === 0 ? 1 : (this.state.total_pages || 1)}
          </div>
          <div className={end === this.state.total_count ? 'disabled' : ''} onClick={() => this.goToPage(Number(this.state.current_page) + 1)}>
            <Icon src={'navigation/chevron-right'} />
          </div>
          <div className={end === this.state.total_count ? 'disabled' : ''} onClick={() => this.goToPage(this.state.total_pages)}>
            <Icon src={'navigation/last-page'} />
          </div>
        </div>
      </div>)
  }
}

export default Paginate;
