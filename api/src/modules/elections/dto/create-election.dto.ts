import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

enum ElectionType {
  PRESIDENTIELLE = 'PRESIDENTIELLE',
  LEGISLATIVES = 'LEGISLATIVES',
  REGIONALES = 'REGIONALES',
  MUNICIPALES = 'MUNICIPALES',
  REFERENDUM = 'REFERENDUM',
}

enum GeographicScope {
  NATIONAL = 'NATIONAL',
  REGIONAL = 'REGIONAL',
  DEPARTEMENTAL = 'DEPARTEMENTAL',
  COMMUNAL = 'COMMUNAL',
}

export class CreateElectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(ElectionType)
  type: ElectionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GeographicScope)
  geographic_scope: GeographicScope;

  @IsUUID()
  @IsOptional()
  scope_region_id?: string;

  @IsUUID()
  @IsOptional()
  scope_departement_id?: string;

  @IsUUID()
  @IsOptional()
  scope_commune_id?: string;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  round?: number;

  @IsUUID()
  @IsOptional()
  parent_election_id?: string;
}
