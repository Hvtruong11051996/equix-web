import s from './Spinner.module.css'
const Spinner1 = () => {
    return <div className={s.spinner1}></div>
}
const Spinner2 = () => {
    return <div className={s.spinner2}><div></div><div></div><div></div><div></div></div>
}
export {
    Spinner1,
    Spinner2
}
