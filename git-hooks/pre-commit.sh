set -e

if $(yarn install) >/dev/null 2>&1
then
    echo "Yarn failed. Aborting."
    exit 1
fi

if $(yarn generate) >/dev/null 2>&1
then
    echo "Scss type-def generation failed. Aborting."
    exit 1
fi

if $(yarn test) >/dev/null 2>&1
then
    echo "Tests failed. Aborting."
    exit 1
fi

if $(yarn typecheck) >/dev/null 2>&1
then
    echo "Typechecking failed. Aborting."
    exit 1
fi

echo "Alls good"
exit 0