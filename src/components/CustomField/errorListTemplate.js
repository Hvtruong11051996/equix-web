export function ErrorListTemplate(props) {
    const { errors } = props;
    return (
        <div className='jsonSchemaErrorList'>
            {errors.map((error, i) => {
                return (
                    <li key={i}>
                        {error.stack}
                    </li>
                );
            })}
        </div>
    );
}
