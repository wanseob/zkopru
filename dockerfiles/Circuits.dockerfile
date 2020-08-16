FROM node:13-alpine
RUN apk update && apk add bash
RUN npm install -g circom snarkjs@0.1.31
WORKDIR /proj
COPY package.json /proj/package.json
RUN npm install
COPY impls /proj/impls
COPY lib /proj/lib
RUN mkdir /proj/script
COPY script/compile_circuits.sh /proj/script/compile_circuits.sh
RUN /bin/bash /proj/script/compile_circuits.sh
COPY script/snark_setup.sh /proj/script/snark_setup.sh
RUN /bin/bash /proj/script/snark_setup.sh
CMD /bin/bash