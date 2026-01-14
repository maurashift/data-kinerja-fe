import { FiHome } from "react-icons/fi";
import { FormEditMasterOpd } from "../../../app/dataMaster/masterOpd/FormMasterOpd";
import { Link } from "lucide-react";

const editOpd = () => {
    return(
        <>
            <div className="flex items-center mb-3">
                <Link href="/" className="mr-1"><FiHome /></Link>
                <p className="mr-1">/ Perencanaan</p>
                <p className="mr-1">/ Data Master</p>
                <p className="mr-1">/ Master OPD</p>
                <p className="mr-1">/ Edit</p>
            </div>
            <FormEditMasterOpd />
        </>
    )
}

export default editOpd;